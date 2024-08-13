import { fromEvent, scan, throttleTime } from 'rxjs';
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
})();
