import React from 'react';

interface CharacterCountProps {
  value: string;
  limit: number;
}

const CharacterCount: React.FC<CharacterCountProps> = ({ value, limit }) => {
  const count = value ? value.length : 0;
  const isOverLimit = count > limit;

  return (
    <span className={`ml-2 text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
      {count}/{limit}
    </span>
  );
};

export default CharacterCount; 