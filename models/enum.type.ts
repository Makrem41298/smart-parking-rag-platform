export enum AccountStatus {
    ACTIVE = "ACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED", // Better than BLOCKED for temporary restrictions
    BLOCKED = "BLOCKED",     // Keep if permanent/admin block is needed
}

export enum Role {
    CLIENT = "CLIENT",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
}

export enum ParkingStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    MAINTENANCE = "MAINTENANCE",
    FULL = "FULL",           // Parking has no available spots
}

export enum PlanStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    ARCHIVED = "ARCHIVED",   // Plan no longer offered
}

export enum SubscriptionStatus {
    PENDING = "PENDING",     // Waiting for payment/activation
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    CANCELED = "CANCELED",
    EXPIRED = "EXPIRED",
}

export enum ReservationStatus {
    PENDING = "PENDING",         // Waiting for validation
    CONFIRMED = "CONFIRMED",
    CHECKED_IN = "CHECKED_IN",   // User entered parking
    COMPLETED = "COMPLETED",     // Reservation finished
    CANCELED = "CANCELED",
    EXPIRED = "EXPIRED",
    NO_SHOW = "NO_SHOW",         // User never arrived
}

export enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
    REFUND_REQUESTED = "REFUND_REQUESTED",
}

export enum ReclamationStatus {
    OPEN = "OPEN",               // Newly created
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED",
    CLOSED = "CLOSED",           // Ticket closed after resolution
}