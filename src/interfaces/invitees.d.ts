export interface IInvitee {
    id?: string;
    name: string;
    phone: string;
    total_person: number;
    priority: boolean;
    message?: string;
    arrived_at?: string;
    invitation_link?: string;
    qr: string;
}