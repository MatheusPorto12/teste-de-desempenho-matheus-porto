import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({
        product: 'Produto Promocional',
        quantity: 1,
        userId: __VU,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = http.post(`${BASE_URL}/checkout/simple`, payload, params);

    check(response, {
        'status is 201': (r) => r.status === 201,
        'transaction approved': (r) => {
            const body = JSON.parse(r.body);
            return body.status === 'APPROVED';
        },
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
