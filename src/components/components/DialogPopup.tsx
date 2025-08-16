import React, { type ReactNode } from 'react';
import { Button } from './Button';

export interface DialogButton {
	text: ReactNode;
	onClick?: ()=> void;
	className?: string;
	type?: 'button' | 'reset' | 'submit';
}

export interface DialogPopupProps {
	isOpen: boolean;
	title: ReactNode;
	children: ReactNode;
	buttons: DialogButton[];

	onBackdropClick?: ()=> void;
}

export const DialogPopup: React.FC<DialogPopupProps> = ({
	isOpen,
	title,
	children,
	buttons,
	onBackdropClick
}) => {

	if (!isOpen) {

		return null;

	}

	return (
		<div // Dialog Backdrop
			className={'fixed top-0 left-0 z-50 size-full bg-black/60 flex items-center justify-center'}
			onClick={onBackdropClick}
		>
			<div
				className={'border-2 border-white bg-gray-900 w-full max-w-lg m-4 rounded-lg shadow-xl'}
				onClick={(e) => {

					e.stopPropagation(); // Prevent click from bubbling up to the backdrop

				}}
			>
				<div className={'flex flex-col p-6'}>
					{/* Dialog Title */}
					<h1 className={'w-fit pb-3 text-left text-2xl font-bold text-white'}>
						{title}
					</h1>

					{/* Dialog Body Content */}
					<div className={'my-4 text-gray-300 text-lg'}>
						{children}
					</div>

					{/* Dialog Buttons */}
					<div className={'mt-5 flex w-full justify-end gap-4'}>
						{buttons.map((
							btn,
							index
						) => (
							<Button
								key={index}
								small
								className={btn.className}
								type={btn.type}
								onClick={btn.onClick}
							>
								{btn.text}
							</Button>
						))}
					</div>
				</div>
			</div>
		</div>
	);

};
