<?php
namespace App\Mail;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Address, Content, Envelope};
class ContactReplyMail extends Mailable
{
    public function __construct(public array $reply) {}
    public function envelope(): Envelope { return new Envelope(subject: 'Boutique Luxxe: '.$this->reply['subject'], replyTo: [new Address((string) config('mail.contact.address'))]); }
    public function content(): Content { return new Content(view: 'emails.contact-reply'); }
}
