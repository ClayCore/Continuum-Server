import { FLAG_ENABLE_OTP_FOR_VERIFICATION } from '../../utils/constants';
import { getExpireTime } from '../../utils/time';
import { getUid } from '../../utils/random';
import { sendEmail } from '../../config/smtp-transporter';
import UserCollection from './UserCollection';
import UserDocument from './UserDocument';

export const OTP_LENGTH: number = 4;
const OTP_EXPIRE_TIME: number = 10;

export const refreshOtpThenSendToUser = (email: string): Promise<any> => {
    if (!FLAG_ENABLE_OTP_FOR_VERIFICATION) {
        return Promise.reject(new Error('OTP Sending is not enabled!'));
    } else {
        return UserCollection.findOne({ email: email })
            .exec()
            .then((user: UserDocument | null) => {
                if (user) {
                    user.OTP = getUid(OTP_LENGTH);
                    user.otpExpireTime = getExpireTime(OTP_EXPIRE_TIME);
                    return user.save().then((saved: UserDocument) => {
                        const subject: string = '[Continuum]: OTP verification auth code';
                        const content: string = `[Continuum OTP]: \n\t${saved.OTP}`;

                        return sendEmail(email, subject, content);
                    });
                } else {
                    return Promise.reject(new Error('Cannot find the user.'));
                }
            });
    }
};
