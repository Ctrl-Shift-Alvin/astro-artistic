import {
	useCallback,
	useEffect, useState
} from 'react';
import clsx from 'clsx';
import { LanguageSelect } from '../components/LanguageSelect';
import { NavMenuItem } from '../components/NavMenuItem';
import { NavbarConfig } from '@/shared/config/navbar';
import {
	cGetUserLanguage, cSetUserLanguage
} from '@/shared/cookies';
import { windowRefresh } from '@/frontend/windowTools';

export const Navbar = ({
	availableLanguages,
	defaultLanguageCode
}: {
	availableLanguages: {
		name: string;
		code: string;
	}[];
	defaultLanguageCode: string;
}) => {

	const selectedLanguageCode = cGetUserLanguage();

	const handleLanguageChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => {

			const langCode: string = event.target.value;
			cSetUserLanguage(langCode);

			windowRefresh();

		},
		[]
	);

	const [
		hamburgerOpen,
		setHamburgerOpen
	] = useState(false);
	const handleHamburgerClick = useCallback(
		() => {

			setHamburgerOpen(!hamburgerOpen);

		},
		[ hamburgerOpen ]
	);

	const [
		hamburgerBackgroundAlpha,
		setHamburgerBackgroundAlpha
	] = useState(true);

	useEffect(
		() => {

			const handleScroll = () => {

				if (window.scrollY > 0) {

					setHamburgerBackgroundAlpha(false);

				} else {

					setHamburgerBackgroundAlpha(true);

				}

			};
			window.addEventListener(
				'scroll',
				handleScroll
			);
			window.onresize = () => {

				setHamburgerOpen(false);

			};
			return () => {

				window.removeEventListener(
					'scroll',
					handleScroll
				);

			};

		},
		[]
	);

	return (
		<>
			<div
				id={'hamburger-div'}
				className={
					clsx(
						'fixed top-0 z-50 flex h-min w-full',
						'justify-center bg-gradient-to-b from-black via-black via-80% to-black/5 py-5',
						'transition-colors duration-500 sm:hidden',
						hamburgerBackgroundAlpha && !hamburgerOpen && 'bg-none'
					)
				}
			>
				<svg
					xmlns={'http://www.w3.org/2000/svg'}
					width={'48'}
					height={'48'}
					viewBox={'0 0 24 24'}
					fill={'none'}
					stroke={'currentColor'}
					strokeWidth={'2'}
					strokeLinecap={'round'}
					strokeLinejoin={'round'}
					className={'cursor-pointer'}
					onClick={handleHamburgerClick}
				>
					<line
						x1={'3'}
						y1={'6'}
						x2={'21'}
						y2={'6'}
					/>

					<line
						x1={'3'}
						y1={'12'}
						x2={'21'}
						y2={'12'}
					/>

					<line
						x1={'3'}
						y1={'18'}
						x2={'21'}
						y2={'18'}
					/>
				</svg>
			</div>

			<nav
				className={
					clsx(
						'fixed top-0 z-40 pt-20 pb-7 flex w-full flex-col justify-start',
						'bg-gradient-to-b from-black via-black via-95% to-gray-900/0',
						'transition-transform duration-500 sm:hidden',
						hamburgerOpen
							? 'translate-y-0'
							: '-translate-y-full'
					)
				}
			>
				{
					NavbarConfig(window.__TRANSLATION__).map((item) => (
						<ol
							key={item.name}
							className={'flex flex-col justify-start text-center text-2xl'}
						>
							<NavMenuItem href={item.href}>
								{item.name}
							</NavMenuItem>
						</ol>
					))
				}

				<LanguageSelect
					availableLanguages={availableLanguages}
					selectedLanguageCode={selectedLanguageCode}
					defaultLanguageCode={defaultLanguageCode}
					className={'mt-5'}
					onLanguageChange={handleLanguageChange}
				/>
			</nav>

			<div
				className={
					clsx(
						'fixed z-30 h-full w-full',
						!hamburgerOpen && 'hidden'
					)
				}
				onMouseDown={
					() => {

						setHamburgerOpen(false);

					}
				}
			/>

			<nav
				className={'absolute z-50 hidden w-full justify-center pt-8 pb-18 sm:flex'}
			>
				{
					NavbarConfig(window.__TRANSLATION__).map((item) => (
						<ol
							key={item.name}
							className={'mx-5 font-medium text-gray-200'}
						>
							<NavMenuItem href={item.href}>
								{item.name}
							</NavMenuItem>
						</ol>
					))
				}

				<LanguageSelect
					availableLanguages={availableLanguages}
					selectedLanguageCode={selectedLanguageCode}
					defaultLanguageCode={defaultLanguageCode}
					className={'absolute top-18 left-1/2 -translate-x-1/2 lg:top-7 lg:right-2 lg:left-auto lg:-translate-x-0'}
					onLanguageChange={handleLanguageChange}
				/>
			</nav>
		</>
	);

};
