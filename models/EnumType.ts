export  enum AccountStatus {
    ACTIVE= "ACTIVE" ,
    BLOCKED= "BLOCKED" ,
    PENDING= "PENDING" ,
}
export enum Role{
    CLIENT= "CLIENT",
    ADMIN= "ADMIN",
}
export enum ParkingStatus {
    OPEN= "OPEN",
    CLOSE= "CLOSE",
    MAINTENANCE= "MAINTENANCE",
}
export enum PlanStatus {
    ACTIVE= "ACTIVE",
    SUSPENDED= "SUSPENDED",
}
export enum SubscriptionStatus {
    ACTIVE= "ACTIVE",
    SUSPENDED= "SUSPENDED",
    CANCELED= "CANCELED",
    EXPIRED= "EXPIRED",
}
export enum ReservationStatus {
    REQUESTED= "REQUESTED",
    CONFIRMED= "CONFIRMED",
    CANCELED= "CANCELED",
    EXPIRED= "EXPIRED",
    USED= "USED",
}
export enum PaymentStatus {
    ACTIVE= "SUCCESS",
    REFUSED= "FAILED",
    PENDING= "PENDING",
}