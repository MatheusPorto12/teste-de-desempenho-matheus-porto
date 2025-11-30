import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 1,
    duration: '30s',
    thresholds: {
        http_req_failed: ['rate==0'],
        http_req_duration: ['p(95)<200'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const response = http.get(`${BASE_URL}/health`);

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response has status UP': (r) => {
            const body = JSON.parse(r.body);
            return body.status === 'UP';
        },
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1);
}
