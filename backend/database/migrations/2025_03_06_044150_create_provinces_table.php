<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('code')->unique(); // Mã tỉnh/thành phố
            $table->string('name', 100);              // Tên tiếng Việt
            $table->string('name_en', 100)->nullable(); // Tên tiếng Anh
            $table->string('type', 50);               // Loại (tỉnh/thành phố trung ương)
            $table->timestamps();
            $table->softDeletes();

            // Index cho tìm kiếm và join
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provinces');
    }
};
