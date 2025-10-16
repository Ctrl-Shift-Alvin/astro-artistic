import {
	A,
	type IAProps
} from '@/components/elements/A';

/**
 * A refresh icon surrounded by an A component, to which props are passed.
 */
export const RefreshIcon = (props: IAProps) => {

	return (
		<A {...props}>
			<svg
				xmlns={'http://www.w3.org/2000/svg'}
				width={'24'}
				height={'24'}
				viewBox={'0 0 24 24'}
				fill={'none'}
				stroke={'currentColor'}
				strokeWidth={'2'}
				strokeLinecap={'round'}
				strokeLinejoin={'round'}
			>
				<path d={'M3 2v6h6'} />
				<path d={'M21 12A9 9 0 0 0 6 5.3L3 8'} />
				<path d={'M21 22v-6h-6'} />
				<path d={'M3 12a9 9 0 0 0 15 6.7l3-2.7'} />
			</svg>

			{props.children}
		</A>
	);

};
