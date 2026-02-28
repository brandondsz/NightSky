import { useStarsContext } from '@/hooks/useStarsContext';
import { MAX_STARS } from '@/utils/constants';

export function StarCounter() {
  const { stars } = useStarsContext();

  return (
    <span className="star-counter">
      {stars.length} / {MAX_STARS} stars
    </span>
  );
}
