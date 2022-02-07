import { fireEvent, render, screen, within } from '@testing-library/react';
import Button from './Button';

describe('<Button />', () => {
  it('passes props correctly', () => {
    const mockOnClick = jest.fn();

    render(
      <Button
        className="foo"
        href="https://bar.com"
        icon="back"
        onClick={mockOnClick}
        text="baz"
      />
    );

    const icon = screen.getByTestId('icon-back');
    const button = screen.getByRole('link');

    expect(icon).toBeInTheDocument();
    expect(button).toHaveClass('foo');
    expect(button).toHaveAttribute('href', 'https://bar.com');
    expect(button).toHaveTextContent('baz');

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('respons to small prop correctly', () => {
    render(
      // @ts-expect-error TODO: Fix params that should be optional in ts refactor.
      <Button small href="https://bar.com" icon="back" />
    );

    const icon = screen.getByTestId('icon-back');

    expect(icon).toHaveAttribute('height', '18');
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveClass('me-1');
  });
});
