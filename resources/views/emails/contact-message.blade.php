<x-mail::message>
# New website enquiry

**Name:** {{ $contact['name'] }}
**Email:** {{ $contact['email'] }}
**Subject:** {{ $contact['subject'] }}

{{ $contact['message'] }}

Reply directly to this email to contact {{ $contact['name'] }}.
</x-mail::message>
