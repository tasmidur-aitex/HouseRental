<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Resources\PropertyResource;
use App\Model\Inquiry;
use App\Model\Property;
use App\Order;
use App\User;
use Illuminate\Http\Request;

class ReportController extends ApiController
{
    /** Dashboard numbers. */
    public function summary()
    {
        $byStatus = Property::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $counts = [];
        foreach (Property::STATUS_LABELS as $code => $label) {
            $counts[$label] = (int) ($byStatus[$code] ?? 0);
        }

        return $this->success([
            'properties'        => $counts,
            'users'             => User::count(),
            'new_inquiries'     => Inquiry::where('status', 0)->count(),
            'paid_orders'       => Order::whereIn('status', Order::PAID)->count(),
            'revenue'           => (float) Order::whereIn('status', Order::PAID)->sum('amount'),
            'delivered_today'   => $this->delivered(['date' => date('Y-m-d')])->count(),
            'delivered_total_this_month' => (float) $this->delivered(['month' => date('F'), 'year' => date('Y')])->sum('total_price'),
        ]);
    }

    /**
     * Delivered properties with their total, filtered by ?date=YYYY-MM-DD, ?month=January, ?year=2026.
     */
    public function delivered(array $filters = null)
    {
        $f = $filters ?? request()->all();
        $query = Property::where('status', Property::DELIVERED)->with(['city', 'subcityModel']);

        if (!empty($f['date'])) {
            $query->where('date', date('d-m-y', strtotime($f['date'])));
        }
        if (!empty($f['month'])) {
            $query->where('month', $f['month']);
        }
        if (!empty($f['year'])) {
            $query->where('year', $f['year']);
        }

        return $query;
    }

    public function deliveredReport(Request $request)
    {
        $request->validate(['date' => 'nullable|date', 'month' => 'nullable|string|max:20', 'year' => 'nullable|digits:4']);

        $total = (float) $this->delivered($request->all())->sum('total_price');
        $page  = $this->delivered($request->all())->orderBy('id', 'desc')->paginate($this->perPage($request));

        return $this->paginated($page, PropertyResource::class, 'OK', ['sum_total_price' => $total]);
    }

    public function exportDelivered(Request $request)
    {
        $request->validate(['date' => 'nullable|date', 'month' => 'nullable|string|max:20', 'year' => 'nullable|digits:4']);
        $rows = $this->delivered($request->all())->orderBy('id')->get();

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['code', 'name', 'city', 'address', 'price', 'total_price', 'date', 'month', 'year']);
            foreach ($rows as $p) {
                fputcsv($out, [$p->property_code, $p->name, optional($p->city)->city_name, $p->address,
                    $p->price, $p->total_price, $p->date, $p->month, $p->year]);
            }
            fclose($out);
        }, 'delivered-properties.csv', ['Content-Type' => 'text/csv']);
    }
}
