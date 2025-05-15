<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index()
    {
        return Comment::all();
    }

    public function show($id)
    {
        return Comment::findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'comment_id' => 'required|string|unique:comments,comment_id',
            'account_id' => 'required|string',
            'product_id' => 'required|string',
            'content' => 'nullable|string',
            'rate'=> 'nullable|integer'
        ]);

        return Comment::create($data);
    }

    public function update(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update($request->all());

        return $comment;
    }

    public function destroy($id)
    {
        Comment::destroy($id);
        return response()->json(['message' => 'Bình luận đã xóa']);
    }
}
