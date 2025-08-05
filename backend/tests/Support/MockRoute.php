<?php

namespace Tests\Support;

class MockRoute
{
    private array $parameters;

    public function __construct(array $parameters = [])
    {
        $this->parameters = $parameters;
    }

    public function parameter(string $key): mixed
    {
        return $this->parameters[$key] ?? null;
    }

    public static function withUser(int $userId): self
    {
        return new self(['user' => $userId]);
    }

    public static function withId(int $id): self
    {
        return new self(['id' => $id]);
    }

    public static function empty(): self
    {
        return new self();
    }
}
