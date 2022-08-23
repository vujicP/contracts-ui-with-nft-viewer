import { useAccountId } from 'ui/hooks';
import { BehaviorSubject } from 'rxjs';
import { useLayoutEffect } from 'react';

const accountSubject = new BehaviorSubject('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

export const useGlobalAccountId = () => {
  const { value, onChange: setAccountId, ...accountIdValidation } = useAccountId();

  const onChange = acc => {
    accountSubject.next(acc);
  };

  useLayoutEffect(() => {
    const sub = accountSubject.subscribe(account => setAccountId(account));

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  return { value, onChange, ...accountIdValidation };
};
