import { debounceTime, distinct, fromEvent, interval, map, scan, switchMap, throttleTime, } from 'rxjs';
import fn from './fn';


/**
 * Manual Throttle vs Rxjs Throttle
 */
(() => {
	const btn = document.createElement('button');
	btn.innerHTML = 'Manual Throttle';
	document.body.appendChild(btn);

	btn.addEventListener('click', fn.manualThrottle(() => {
		btn.innerHTML = `Manual Throttle clicked at ${new Date().toLocaleTimeString()}`;
	}, 1000), false);

	const btn2 = document.createElement('button');
	btn2.innerHTML = 'Rxjs Throttle';
	document.body.appendChild(btn2);

	fromEvent(btn2, 'click')
		.pipe(
			throttleTime(1000),
			scan((acc) => {
				return [acc[0] + 1, new Date().toLocaleTimeString()];
			}, [0, new Date().toLocaleTimeString()] as [number, string])
		)
		.subscribe((evt) => {
			btn2.innerHTML = `Rxjs Throttle ${evt[0]} times clicked at ${evt[1]}`;

		});

	const btn3 = document.createElement('button');
	btn3.innerHTML = 'Rxjs Debounce';
	document.body.appendChild(btn3);

	fromEvent(btn3, 'click')
		.pipe(
			debounceTime(1000),
			scan((acc) => {
				return acc + 1;
			}, 0)
		)
		.subscribe((n) => {
			btn3.innerHTML = `Rxjs Debounce triggered ${n} time${n > 1 ? 's' : ''} at ${new Date().toLocaleTimeString()}`;

		});
})();

/**
 * Rxjs Debounce
 */
(() => {
	const btn3 = document.createElement('button');
	btn3.innerHTML = 'Rxjs Debounce';
	document.body.appendChild(btn3);

	fromEvent(btn3, 'click')
		.pipe(
			debounceTime(1000),
			scan((acc) => {
				return acc + 1;
			}, 0)
		)
		.subscribe((n) => {
			btn3.innerHTML = `Rxjs Debounce triggered ${n} time${n > 1 ? 's' : ''} at ${new Date().toLocaleTimeString()}`;

		});
})();

/**
 * Rxjs distinct
 */
(() => {
	const btn = document.createElement('button');
	btn.innerHTML = 'Rxjs distinct';
	document.body.appendChild(btn);

	fromEvent(btn, 'click')
		.pipe(
			map((e: MouseEvent) => {
				return [e.clientX, e.clientY];
			}),
			distinct(e => `${e[0]}-${e[1]}`),
		)
		.subscribe((e) => {
			btn.innerHTML = `Rxjs Distinct [${e}] updated at ${new Date().toLocaleTimeString()}`

		});
})();

/**
 * switchMap
 */
(() => {
	const btn = document.createElement('input');
	btn.placeholder = 'Rxjs switchMap';
	document.body.appendChild(btn);


	fromEvent(btn, 'input')
		.pipe(
			map((event: any) => event.target.value),
			debounceTime(500),
			/**
			 * When a new inner Observable is emitted, 
			 * switchMap stops emitting items from the earlier-emitted inner Observable,
			 * and begins emitting items from the new one
			 */
			switchMap((searchText: string) => {
				console.log('searching for', searchText);
				return fetch(`https://jsonplaceholder.typicode.com/todos/${searchText}`);

			})
		)
		.subscribe((res) => {
			console.log(res)
			res.json().then((data) => {
				if (btn.nextElementSibling?.tagName === 'SPAN') {
					btn.nextElementSibling.remove();
				}
				if (data.title === undefined) {
					return;
				}
				const span = document.createElement('span');
				span.innerHTML = JSON.stringify(data.title);
				btn.insertAdjacentElement('afterend', span);
			});

		});
})();