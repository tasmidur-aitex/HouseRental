<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use Illuminate\Http\Request;

/**
 * Generic admin CRUD. A child only declares the model, resource, validation rules and
 * how request keys map onto columns.
 */
abstract class AdminCrudController extends ApiController
{
    /** @var string Eloquent model class */
    protected $model;
    /** @var string API resource class */
    protected $resource;
    /** @var array columns searched by ?q= */
    protected $searchable = [];
    /** @var array relations eager loaded */
    protected $with = [];

    abstract protected function rules(Request $request, $id = null): array;

    /** Convert validated input to column => value (override when names differ). */
    protected function attributes(array $validated): array
    {
        return $validated;
    }

    public function index(Request $request)
    {
        $query = ($this->model)::with($this->with)->orderBy('id', 'desc');

        if ($request->filled('q') && $this->searchable) {
            $like = '%' . $request->query('q') . '%';
            $query->where(function ($w) use ($like) {
                foreach ($this->searchable as $col) {
                    $w->orWhere($col, 'like', $like);
                }
            });
        }

        return $this->paginated($query->paginate($this->perPage($request)), $this->resource);
    }

    public function show($id)
    {
        return $this->success(($this->model)::with($this->with)->findOrFail($id), 'OK', $this->resource);
    }

    public function store(Request $request)
    {
        $item = ($this->model)::create($this->attributes($request->validate($this->rules($request))));

        return $this->created($item->load($this->with), 'Created', $this->resource);
    }

    public function update(Request $request, $id)
    {
        $item = ($this->model)::findOrFail($id);
        $item->update($this->attributes($request->validate($this->rules($request, $id))));

        return $this->success($item->fresh($this->with), 'Updated', $this->resource);
    }

    public function destroy($id)
    {
        ($this->model)::findOrFail($id)->delete();

        return $this->deleted();
    }
}
