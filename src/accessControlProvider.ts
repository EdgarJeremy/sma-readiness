import { Application } from "@feathersjs/feathers";
import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: (client: Application) => AccessControlProvider = (client) => ({
    can: async({ resource, action, params }) => {
        try {
            const { user } = await client.reAuthenticate();
            if (user.type == 'vendor' && resource == 'users') return { can: false, reason: 'Unauthorized' }
        } catch(e) {}
        return { can: true };
    },
})