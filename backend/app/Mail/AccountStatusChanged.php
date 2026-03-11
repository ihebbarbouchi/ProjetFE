<?php

namespace App\Mail;

use App\Models\Utilisateur;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Utilisateur $user,
        public string $newStatus // 'active' ou 'rejected'
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->newStatus === 'active'
            ? 'Votre inscription a été approuvée – EduShare'
            : 'Mise à jour concernant votre inscription – EduShare';

        return new Envelope(subject: $subject);
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.account_status',
            with: [
                'user'      => $this->user,
                'status'    => $this->newStatus,
                'loginUrl'  => env('APP_FRONTEND_URL', 'http://localhost:3000') . '/login?logout=true',
            ]
        );
    }
}
