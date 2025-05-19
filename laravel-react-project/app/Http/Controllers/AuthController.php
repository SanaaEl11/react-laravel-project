<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'ice' => 'required|string|unique:entreprises,ice',
            'rc' => 'required|string|unique:entreprises,rc',
            'username' => 'required|string|unique:entreprises,username',
            'email' => 'required|email|unique:entreprises,email',
            'address' => 'required|string',
            'id_secteur' => 'required|exists:secteurs,id',
            'motdepasse' => 'required|string|min:8',
        ]);

        $entreprise = Entreprise::create([
            'ice' => $validated['ice'],
            'rc' => $validated['rc'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'address' => $validated['address'],
            'id_secteur' => $validated['id_secteur'],
            'motdepasse' => Hash::make($validated['motdepasse']),
            'status' => Entreprise::STATUS_PENDING,
        ]);

        return response()->json([
            'message' => 'Registration successful. Please wait for admin approval.',
            'entreprise' => $entreprise
        ], 201);
    }

    public function login(Request $request)
    {
         \Log::debug('Login attempt:', [
        'email' => $request->email,
        'password_input' => $request->motdepasse,
        'admin_exists' => Admin::where('email', $request->email)->exists(),
        'entreprise_exists' => Entreprise::where('email', $request->email)->exists()
    ]);
    \Log::debug('Entreprise Login Attempt', [
        'email' => $request->email,
        'provided_password' => $request->motdepasse,
        'entreprise_exists' => \App\Models\Entreprise::where('email', $request->email)->exists(),
        'password_matches' => \App\Models\Entreprise::where('email', $request->email)
            ->exists() && \Illuminate\Support\Facades\Hash::check(
                $request->motdepasse,
                \App\Models\Entreprise::where('email', $request->email)->value('motdepasse')
            ),
    ]);
        $request->validate([
            'email' => 'required|email',
            'motdepasse' => 'required|string',
        ]);

        // Try admin authentication first
        $admin = Admin::where('email', $request->email)->first();
        if ($admin && Hash::check($request->motdepasse, $admin->motdepasse)) {
            $token = $admin->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Admin login successful',
                'token' => $token,
                'user_type' => 'admin',
                'user' => $admin,
                'status' => 'authenticated'
            ]);
        }

        // Try entreprise authentication
        $entreprise = Entreprise::where('email', $request->email)->first();
        if ($entreprise && Hash::check($request->motdepasse, $entreprise->motdepasse)) {
            if ($entreprise->status === Entreprise::STATUS_ACCEPTED) {
                $token = $entreprise->createToken('entreprise-token')->plainTextToken;

                return response()->json([
                    'message' => 'Entreprise login successful',
                    'token' => $token,
                    'user_type' => 'entreprise',
                    'user' => $entreprise,
                    'status' => 'authenticated'
                ]);
            }

            return response()->json([
                'message' => 'Account not yet approved',
                'user_type' => 'entreprise',
                'status' => $entreprise->status
            ], 403);
        }

        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
