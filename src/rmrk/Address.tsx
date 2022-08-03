import { CopyButton } from 'ui/components/common/CopyButton';
import { truncate } from 'ui/util';

export function Address({ address, length = 10 }) {
  return (
    <div className="inline-flex items-center">
      <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
        {truncate(address, length)}
      </span>
      <CopyButton className="ml-1" value={address} />
    </div>
  );
}
