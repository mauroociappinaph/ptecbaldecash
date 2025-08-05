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
        Schema::table('users', function (Blueprint $table) {
            // Add composite index for search queries (name + last_name)
            $table->index(['name', 'last_name'], 'idx_users_name_last_name');

            // Add composite index for filtering by role and created_at
            $table->index(['role', 'created_at'], 'idx_users_role_created_at');

            // Add composite index for soft deletes with created_at ordering
            $table->index(['deleted_at', 'created_at'], 'idx_users_deleted_created');

            // Add index for email searches (if not already unique indexed)
            // Note: email already has unique index, but this helps with LIKE searches
            $table->index(['email'], 'idx_users_email_search');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_name_last_name');
            $table->dropIndex('idx_users_role_created_at');
            $table->dropIndex('idx_users_deleted_created');
            $table->dropIndex('idx_users_email_search');
        });
    }
};
