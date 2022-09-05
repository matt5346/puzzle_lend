/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-underscore-dangle */
import notification from 'rc-notification';
import { makeAutoObservable } from 'mobx';
import RootStore from '@src/stores/RootStore';
import getAlert, { closeAlertIcon } from '@src/common/utils/alertUtil';

export type TNotifyOptions = Partial<{
  duration: number;
  closable: boolean;
  key: string;

  type: 'error' | 'info' | 'warning' | 'success';
  link?: string;
  linkTitle?: string;
  title: string;
  onClick?: () => void;
  onClickText?: string;
  style: { [key: string]: string | number };
}>;

const style = {
  boxShadow: '0px 8px 24px rgba(54, 56, 112, 0.16)',
  borderRadius: 12,
  padding: 16,
  border: '1px solid #F1F2FE',
};

const styles = {
  error: {
    ...style,
  },
  warning: {
    ...style,
  },
  info: {
    ...style,
  },
  success: {
    ...style,
  },
};

class NotificationStore {
  public rootStore: RootStore;

  _instance?: any;

  constructor(rootStore: RootStore) {
    const width = window.innerWidth;
    const mobileStyle = {
      top: 80,
      right: 16,
      left: 16,
      zIndex: '1000000000000000000',
    };
    const desktopStyle = {
      top: 96,
      right: 16,
      left: width - 320 - 16,
      zIndex: '1000000000000000000',
    };
    this.rootStore = rootStore;
    notification.newInstance(
      {
        closeIcon: closeAlertIcon,
        style: width >= 880 ? desktopStyle : mobileStyle,
      },
      (notification: any) => (this._instance = notification)
    );
    makeAutoObservable(this);
  }

  notify(content: string, opts: TNotifyOptions = {}) {
    if (opts.key) {
      this._instance.removeNotice(opts.key);
    }
    const type = opts.type || 'info';

    try {
      this._instance &&
        this._instance.notice({
          ...opts,
          placement: 'center',
          content: getAlert(content, { ...opts, type }),
          style: {
            ...styles[type],
            ...opts.style,
          },
          className: 'custom-notification',
          duration: opts.duration ?? 5,
          key: opts.key,
          closable: true,
          closeIcon: closeAlertIcon,
        });
    } catch (e) {
      console.error(content);
    }
  }
}

export default NotificationStore;
