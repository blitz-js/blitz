import * as React from 'react';

interface ButtonProps {
    children: React.ReactNode;
}
declare function Button(props: ButtonProps): JSX.Element;
declare namespace Button {
    var displayName: string;
}

export { Button, ButtonProps };
