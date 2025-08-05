<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add composite index for search operations only if it doesn't exist
        $indexExists = DB::select("SELECT name FROM sqlite_master WHERE type='index' AND name='users_search_index'");

        if (empty($indexExists)) {
            Schema::table('users', function (Blueprint $table) {
                // Composite index for search operations (name + last_name + email)
                $table->index(['name', 'last_name', 'email'], 'users_search_index');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the search index if it exists
            $table->dropIndex('users_search_index');
        });
    }
};
