import { updateStore, store } from '../configureStore';

export const VIEWED_TUTOR_SET = "VIEWED_TUTOR_SET";
export const VIEWED_TUTOR_CLEARED = "VIEWED_TUTOR_CLEARED";
export const VIEWED_TUTOR_AVAILABILITY_UPDATED = "VIEWED_TUTOR_AVAILABILITY_UPDATED";
export const VIEWED_TUTOR_APPOINTMENT_BOOKED = "VIEWED_TUTOR_APPOINTMENT_BOOKED";
export const VIEWED_TUTOR_APPOINTMENT_CANCELED = "VIEWED_TUTOR_APPOINTMENT_CANCELED";
export const VIEWED_TUTOR_RATED = "VIEWED_TUTOR_RATED";

export async function setViewedTutor(viewedTutor) {
    updateStore(VIEWED_TUTOR_SET, viewedTutor);
}

export function clearViewedTutor() {
    updateStore(VIEWED_TUTOR_CLEARED);
}

export function cancelViewedTutorAppointment(appointment) {
    updateStore(VIEWED_TUTOR_APPOINTMENT_CANCELED, appointment);
}

export function updateViewedTutorSchedule(appointment) {
    updateStore(VIEWED_TUTOR_AVAILABILITY_UPDATED, appointment);

    updateStore(VIEWED_TUTOR_APPOINTMENT_BOOKED, appointment);
}

export function updateTutorRating(newRating) {
    updateStore(VIEWED_TUTOR_RATED, newRating);
}