import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 200 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 1000 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.5'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({
        product: 'Produto com Criptografia',
        quantity: 1,
        userId: __VU,
        timestamp: Date.now(),
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: '30s',
    };

    const response = http.post(`${BASE_URL}/checkout/crypto`, payload, params);

    check(response, {
        'status is 201': (r) => r.status === 201,
        'transaction secure': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.status === 'SECURE_TRANSACTION';
            } catch (e) {
                return false;
            }
        },
        'response time < 1000ms': (r) => r.timings.duration < 1000,
        'response time < 2000ms': (r) => r.timings.duration < 2000,
        'response time < 5000ms': (r) => r.timings.duration < 5000,
    });

    sleep(0.5);
}
