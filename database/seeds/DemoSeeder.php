<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** Starter data for a fresh install (cities, areas, site settings). Safe to run repeatedly. */
class DemoSeeder extends Seeder
{
    public function run()
    {
        $places = [
            'Dhaka'      => ['Mirpur', 'Dhanmondi', 'Gulshan', 'Uttara', 'Mohammadpur'],
            'Chattogram' => ['Agrabad', 'Khulshi', 'Nasirabad'],
            'Sylhet'     => ['Zindabazar', 'Ambarkhana'],
        ];

        foreach ($places as $city => $areas) {
            $cityId = DB::table('cities')->where('city_name', $city)->value('id');
            if (!$cityId) {
                $cityId = DB::table('cities')->insertGetId(['city_name' => $city, 'created_at' => now(), 'updated_at' => now()]);
            }
            foreach ($areas as $area) {
                if (!DB::table('subcities')->where('city_id', $cityId)->where('subcity_name', $area)->exists()) {
                    DB::table('subcities')->insert(['city_id' => $cityId, 'subcity_name' => $area, 'created_at' => now(), 'updated_at' => now()]);
                }
            }
        }

        if (!DB::table('sitesetting')->exists()) {
            DB::table('sitesetting')->insert([
                'company_name' => 'Bariwala', 'email_one' => 'hello@example.com', 'phone_one' => '+880 1700-000000',
                'address_one' => 'Dhaka, Bangladesh', 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }
}
