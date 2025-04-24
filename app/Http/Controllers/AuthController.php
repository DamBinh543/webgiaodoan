<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Notifications\LoginNotification;

class AuthController extends Controller
{
    // Đăng ký tài khoản mới
    public function register(Request $request)
    {
        // Validate dữ liệu
        $request->validate([
            'username' => 'required|string|unique:accounts,username|max:255',
            'phone' => 'required|string|size:10|unique:accounts,phone',
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required|same:password',
            'userType' => 'required|string|in:admin,user',
            'address' => 'required|string',
            'join' => 'required|date',
        ]);

        // Tạo tài khoản mới
        $account = new Account();
        $account->username = $request->username;
        $account->phone = $request->phone;
        $account->password = Hash::make($request->password);
        $account->userType = $request->userType;
        $account->address = $request->address;
        $account->join = $request->join;
        $account->save();

        // Trả về thông tin đăng nhập (token hoặc thông báo đăng ký thành công)
        return response()->json([
            'message' => 'Tạo tài khoản thành công!',
            'account' => $account
        ]);
    }

    // Đăng nhập
    public function login(Request $request)
    {
        // Validate dữ liệu đăng nhập
        $request->validate([
            'phone' => 'required|string|size:10',
            'password' => 'required|string|min:6',
        ]);

        $account = Account::where('phone', $request->phone)->first();

        if (!$account || !Hash::check($request->password, $account->password)) {
            return response()->json(['message' => 'Sai tài khoản hoặc mật khẩu'], 401);
        }

        // Tạo token cho người dùng sau khi đăng nhập thành công
        $token = Str::random(60);
        $account->api_token = $token;
        $account->save();

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'token' => $token,
            'account' => $account
        ]);
    }

    // Lấy thông tin người dùng hiện tại
    public function user(Request $request)
    {
        $account = $request->user();  // Lấy thông tin người dùng dựa trên API token đã xác thực

        return response()->json($account);
    }

    // Cập nhật thông tin người dùng
    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);

        $account->update($request->all());

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'account' => $account
        ]);
    }

    // Đổi mật khẩu
    public function changePassword(Request $request)
    {
        // Validate yêu cầu đổi mật khẩu
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
            'new_password_confirmation' => 'required|same:new_password',
        ]);

        $account = $request->user(); // Lấy thông tin người dùng

        if (!Hash::check($request->current_password, $account->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng'], 401);
        }

        // Đổi mật khẩu
        $account->password = Hash::make($request->new_password);
        $account->save();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công!',
            'account' => $account
        ]);
    }
}
