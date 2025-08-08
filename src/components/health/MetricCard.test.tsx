import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '@/components/health/MetricCard';
import { Heart } from 'lucide-react';
import React from 'react';

describe('MetricCard', () => {
  it('renders title and value', () => {
    const { getByText } = render(
      <MetricCard title="Resting HR" value={48} unit="bpm" icon={Heart} />
    );
    expect(getByText('Resting HR')).toBeInTheDocument();
    expect(getByText('48')).toBeInTheDocument();
    expect(getByText('bpm')).toBeInTheDocument();
  });
});
