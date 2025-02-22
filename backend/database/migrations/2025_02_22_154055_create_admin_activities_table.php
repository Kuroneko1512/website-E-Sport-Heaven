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
        Schema::create('admin_activities', function (Blueprint $table) {
            // Khoá chính và khoá ngoại
            $table->id();
            $table->foreignId('admin_id')->constrained('admins');

            // Thông tin hoạt động
            $table->string('action')->index();  // create, update, delete
            $table->string('module')->index();  // products, orders, admins, roles
            $table->string('entity_type');      // App\Models\Product
            $table->unsignedBigInteger('entity_id');

            // Dữ liệu thay đổi
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Thông tin truy cập
            $table->string('ip_address');
            $table->text('user_agent');
            $table->timestamps();

            // Indexes cho audit queries
            $table->index(['admin_id', 'created_at']);
            $table->index(['module', 'action']);
            $table->index(['entity_type', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activities');
    }
};
