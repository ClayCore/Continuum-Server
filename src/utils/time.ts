export const getExpireTime = (minute: number): Date => {
    const expire_time = new Date(Date.now());
    expire_time.setMinutes(expire_time.getMinutes() + minute);

    return expire_time;
};
