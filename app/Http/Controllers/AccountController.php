<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function index()
    {
        return Account::all();
    }

    public function show($id)
    {
        return Account::findOrFail($id);
    }

    public function store(Request $request)
    {
        // Validate request data
        $data = $request->validate([
            'username' => 'required|string|unique:accounts,username',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|size:10|unique:accounts,phone',
            'address' => 'nullable|string', 
            'userType' => 'required|string|in:admin,user',
            'join' => 'nullable|date',
        ]);
    
        // Tạo ID tài khoản tự động
        $data['account_id'] = 'user_' . time(); // Tạo account_id tự động
    
        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        $data['password'] = bcrypt($data['password']);
    
        // Tạo tài khoản mới
        $account = Account::create($data);
    
        // Trả về phản hồi với thông báo thành công và dữ liệu tài khoản
        return response()->json([
            'message' => 'Tạo tài khoản thành công!',
            'data' => $account
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|size:10',
            'password' => 'required|string|min:6',
        ]);

        $user = Account::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Sai tài khoản hoặc mật khẩu'], 401);
        }

        return response()->json($user);
    }

    public function update(Request $request, $id)
{
    $account = Account::findOrFail($id);
    $validated = $request->validate([
        'username' => 'nullable|string',
        'address' => 'nullable|string',
        'password' => 'sometimes|string|confirmed|min:6',
    ]);

    if (isset($validated['password'])) {
        $validated['password'] = bcrypt($validated['password']);
    }

    $account->update($validated);

    return response()->json([
        'message' => 'Cập nhật thành công',
        'data' => $account
    ]);
}

    public function destroy($id)
    {
        Account::destroy($id);
        return response()->json(['message' => 'Tài khoản đã được xóa']);
    }
}
