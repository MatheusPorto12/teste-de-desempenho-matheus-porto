import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '10s', target: 300 },
        { duration: '1m', target: 300 },
        { duration: '10s', target: 10 },
        { duration: '30s', target: 10 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.1'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({
        product: 'Ingresso Flash Sale',
        quantity: 1,
        userId: __VU,
        timestamp: Date.now(),
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
            try {
                const body = JSON.parse(r.body);
                return body.status === 'APPROVED';
            } catch (e) {
                return false;
            }
        },
        'response time < 500ms': (r) => r.timings.duration < 500,
        'response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    sleep(0.5);
}
