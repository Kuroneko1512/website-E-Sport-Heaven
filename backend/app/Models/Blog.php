<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'content', 'category_id', 'thumbnail','publish_date','is_featured'];
    protected $appends = ['status'];

    public function category()
    {
        return $this->belongsTo(BlogCategory::class);
    }
    public function getStatusAttribute()
    {
        if($this->publish_date > now()){
            return "draft";
        }
        return "published";
    }
}
