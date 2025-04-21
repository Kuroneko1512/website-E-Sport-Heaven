<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug','description'];
    protected $appends = ['blogs_count'];
    public function getBlogsCountAttribute()
    {
        return $this->blogs()->count();
    }

    public function blogs()
    {
        return $this->hasMany(Blog::class, 'category_id', 'id');
    }
}
