<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class EmailDeliveryException extends Exception
{
    protected $emailType;
    protected $recipient;

    public function __construct(string $message, string $emailType = 'unknown', string $recipient = 'unknown')
    {
        parent::__construct($message);
        $this->emailType = $emailType;
        $this->recipient = $recipient;
    }

    /**
     * Report the exception.
     */
    public function report(): void
    {
        Log::warning('Email delivery failed', [
            'message' => $this->getMessage(),
            'email_type' => $this->emailType,
            'recipient' => $this->recipient,
            'trace' => $this->getTraceAsString()
        ]);
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Failed to send email notification. The user was created but email delivery failed.',
            'error_code' => 'EMAIL_DELIVERY_FAILED',
            'details' => [
                'email_type' => $this->emailType,
                'recipient' => $this->recipient
            ]
        ], 207); // 207 Multi-Status - partial success
    }

    /**
     * Get the email type.
     */
    public function getEmailType(): string
    {
        return $this->emailType;
    }

    /**
     * Get the recipient.
     */
    public function getRecipient(): string
    {
        return $this->recipient;
    }
}
