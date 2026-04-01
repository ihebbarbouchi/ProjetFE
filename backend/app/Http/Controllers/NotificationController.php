<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Liste les notifications de l'utilisateur connecté, triées du plus récent au plus ancien.
     */
    public function index(Request $request)
    {
        $notifications = Notification::forUser($request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Marque une notification comme lue.
     */
    public function markAsRead(Request $request, int $id)
    {
        $notification = Notification::forUser($request->user()->id)->findOrFail($id);
        $notification->update(['lu' => true]);

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    /**
     * PATCH /api/notifications/read-all
     * Marque toutes les notifications de l'utilisateur comme lues.
     */
    public function markAllAsRead(Request $request)
    {
        Notification::forUser($request->user()->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }

    /**
     * DELETE /api/notifications/{id}
     * Supprime une notification.
     */
    public function destroy(Request $request, int $id)
    {
        $notification = Notification::forUser($request->user()->id)->findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }

    /**
     * GET /api/notifications/unread-count
     * Retourne le nombre de notifications non lues.
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::forUser($request->user()->id)->nonLues()->count();

        return response()->json(['count' => $count]);
    }
}
