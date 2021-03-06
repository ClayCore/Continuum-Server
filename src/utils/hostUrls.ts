const normalizePort = (port: number): number => {
    const port_env = process.env.PORT;
    console.log(`[PORT_ENV]: ${port_env}`);

    if (!port_env) {
        return port;
    }

    return Number.parseInt(port_env);
};

export const HOSTNAME_DEV: string = 'http://localhost';
export const HOSTNAME_ANDROID_LOCAL: string = 'http://10.0.2.2';
export const HOSTPORT_DEV: number = 1234;
export const SERVERPORT_DEV: number = 3001;

export const HOSTURL_DEV: string = `${HOSTNAME_DEV}:${HOSTPORT_DEV}`;

export const HOSTNAME_PROD: string = '0.0.0.0';
export const HOSTPORT_PROD: number = normalizePort(80);
export const SERVERPORT_PROD: number = HOSTPORT_PROD;

let url: string;
if (HOSTPORT_PROD === 80) {
    url = HOSTNAME_PROD;
} else {
    url = `${HOSTNAME_PROD}:${HOSTPORT_PROD}`;
}

export const HOSTURL_PROD = url;
export const CORS_WHITELIST: string[] = [`${HOSTNAME_ANDROID_LOCAL}:${HOSTPORT_DEV}`, HOSTURL_DEV];
