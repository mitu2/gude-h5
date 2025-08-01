import { toast } from 'react-toastify';

export interface NotificationOptions {
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: 'light' | 'dark' | 'colored';
}

export const toastConfig: NotificationOptions = {
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

export const notification = {
  success: (message: string, options?: NotificationOptions) => {
    toast.success(message, { ...toastConfig, ...options });
  },

  error: (message: string, options?: NotificationOptions) => {
    toast.error(message, { ...toastConfig, ...options });
  },

  warning: (message: string, options?: NotificationOptions) => {
    toast.warning(message, { ...toastConfig, ...options });
  },

  info: (message: string, options?: NotificationOptions) => {
    toast.info(message, { ...toastConfig, ...options });
  },

  loading: (message: string, options?: NotificationOptions) => {
    return toast.loading(message, { ...toastConfig, ...options });
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  update: (toastId: string | number, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', options?: NotificationOptions) => {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
      ...toastConfig,
      ...options,
    });
  },
};

export default notification;