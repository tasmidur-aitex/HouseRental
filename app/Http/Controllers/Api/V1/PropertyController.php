<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\PropertyResource;
use App\Model\Property;
use Illuminate\Http\Request;

/** Public listing, search and details. Only published properties are exposed. */
class PropertyController extends ApiController
{
    public function index(Request $request)
    {
        $request->validate([
            'sort'      => 'nullable|in:latest,oldest,price_asc,price_desc',
            'badge'     => 'nullable|in:trend,best_rated,hot_new',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
        ]);

        $paginator = Property::public()
            ->with(['city', 'subcityModel'])
            ->filter($request->query())
            ->paginate($this->perPage($request, 12));

        return $this->paginated($paginator, PropertyResource::class);
    }

    public function show($id)
    {
        $property = Property::public()->with(['city', 'subcityModel'])->findOrFail($id);

        return $this->success($property, 'OK', PropertyResource::class);
    }

    /** Other published properties in the same subcity (falls back to the same city). */
    public function nearby(Request $request, $id)
    {
        $property = Property::public()->findOrFail($id);

        $query = Property::public()->with(['city', 'subcityModel'])->where('id', '!=', $property->id);
        $property->subcity_id
            ? $query->where('subcity_id', $property->subcity_id)
            : $query->where('city_id', $property->city_id);

        return $this->paginated($query->orderBy('id', 'desc')->paginate($this->perPage($request, 6, 24)), PropertyResource::class);
    }
}
