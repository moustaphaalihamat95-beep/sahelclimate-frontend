import { supabase } from "./supabase";

export const sendSMSOTP = async (phone) => {
  // S'assurer que le numéro commence par +235 si l'utilisateur ne l'a pas mis
  const formattedPhone = phone.startsWith('+') ? phone : `+235${phone.replace(/^0+/, '')}`;

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) throw error;
  return data;
};

export const verifySMSOTP = async (phone, token, extraData = {}) => {
  const formattedPhone = phone.startsWith('+') ? phone : `+235${phone.replace(/^0+/, '')}`;

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: token,
    type: 'sms',
  });

  if (error) throw error;

  const userObj = {
    full_name: extraData.fullName || 'Utilisateur SahelClimate',
    phone_number: formattedPhone,
    city: extraData.city || 'N\'Djamena',
    role: 'Agriculteur',
    status: 'Validé',
    session: data.session
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('sahel_user', JSON.stringify(userObj));
  }

  return userObj;
};
