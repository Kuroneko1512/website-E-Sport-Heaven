<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique(); // tạo URL thân thiện
            $table->text('content'); // nội dung bài viết
            $table->string('thumbnail')->nullable(); // ảnh thumbnail
            $table->foreignId('category_id')->constrained('blog_categories')->onDelete('cascade'); // liên kết danh mục
            //onDelete('cascade'): Nếu danh mục hoặc user bị xóa thì bài viết cũng bị xóa theo.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn('thumbnail');
        });
    }
};
