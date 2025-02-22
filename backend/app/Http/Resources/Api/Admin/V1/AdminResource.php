<?php

namespace App\Http\Resources\Api\Admin\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'position'          => $this->position,
            'department'        => $this->department,
            'status'            => $this->status,
            'last_login_at'     => $this->last_login_at?->format('Y-m-d H:i:s'),
            'last_login_ip'     => $this->last_login_ip,
            'roles'             => $this->roles->pluck('name'),
            'permissions'       => $this->getAllPermissions()->pluck('name'),
            'created_at'        => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at'        => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
