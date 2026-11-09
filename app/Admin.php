<?php

namespace App;

use App\Notifications\AdminResetPasswordNotification;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Traits\HasApiTokens;
use Illuminate\Notifications\Notifiable;


class Admin extends Authenticatable
{
    use Notifiable, HasApiTokens;

    public function sendPasswordResetNotification($token)
     {
         $this->notify(new AdminResetPasswordNotification($token));
     }

        protected $guard = 'admin';



        protected $fillable = [
            'name', 'email', 'password','phone'
        ];

        protected $hidden = [
            'password', 'remember_token',
        ];
}
