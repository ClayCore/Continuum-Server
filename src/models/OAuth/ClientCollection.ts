import Client from './Client';
import { HOST_URL } from '../../utils/secrets';

const ClientCollection: Client[] = [
    {
        id: 'aebb974a-3b14-4d58-8a74-72b7436deb71',
        alias: '',
        name: 'Test Client',
        secret: 'test-secret-session',
        hostUrl: HOST_URL,
        redirectUri: `${HOST_URL}/auth/oauth2/callback`,
    },
];

export default ClientCollection;
