import {
  DNDSchedule,
  DNDScheduleCourse,
  SeasonEnum,
  StatusEnum,
} from "../models/types";

const mockClass = (num: number): DNDScheduleCourse => ({
  classId: "3500",
  subject: "CS",
  numCreditsMin: 4,
  numCreditsMax: 4,
  dndId: "class-" + num,
  name: "Object-Oriented Design",
});

export const mockEmptySchedule: DNDSchedule = {
  years: [2019, 2020, 2021, 2022],
  yearMap: {
    2019: {
      year: 2019,
      isSummerFull: false,
      fall: {
        season: SeasonEnum.FL,
        year: 2019,
        termId: 201910,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      spring: {
        season: SeasonEnum.SP,
        year: 2019,
        termId: 201930,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer1: {
        season: SeasonEnum.S1,
        year: 2019,
        termId: 201940,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer2: {
        season: SeasonEnum.S2,
        year: 2019,
        termId: 201960,
        status: StatusEnum.CLASSES,
        classes: [],
      },
    },
    2020: {
      year: 2020,
      isSummerFull: false,
      fall: {
        season: SeasonEnum.FL,
        year: 2020,
        termId: 202010,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      spring: {
        season: SeasonEnum.SP,
        year: 2020,
        termId: 202030,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer1: {
        season: SeasonEnum.S1,
        year: 2020,
        termId: 202040,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer2: {
        season: SeasonEnum.S2,
        year: 2020,
        termId: 202060,
        status: StatusEnum.CLASSES,
        classes: [],
      },
    },
    2021: {
      year: 2021,
      isSummerFull: false,
      fall: {
        season: SeasonEnum.FL,
        year: 2021,
        termId: 202110,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      spring: {
        season: SeasonEnum.SP,
        year: 2021,
        termId: 202130,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer1: {
        season: SeasonEnum.S1,
        year: 2021,
        termId: 202140,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer2: {
        season: SeasonEnum.S2,
        year: 2021,
        termId: 202160,
        status: StatusEnum.CLASSES,
        classes: [],
      },
    },
    2022: {
      year: 2022,
      isSummerFull: false,
      fall: {
        season: SeasonEnum.FL,
        year: 2022,
        termId: 202210,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      spring: {
        season: SeasonEnum.SP,
        year: 2022,
        termId: 202230,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer1: {
        season: SeasonEnum.S1,
        year: 2022,
        termId: 202240,
        status: StatusEnum.CLASSES,
        classes: [],
      },
      summer2: {
        season: SeasonEnum.S2,
        year: 2022,
        termId: 202260,
        status: StatusEnum.CLASSES,
        classes: [],
      },
    },
  },
};

export const mockData: DNDSchedule = {
  years: [2019, 2020],
  yearMap: {
    2019: {
      year: 2019,
      isSummerFull: false,
      fall: {
        season: SeasonEnum.FL,
        year: 2019,
        termId: 201910,
        status: StatusEnum.CLASSES,
        classes: [mockClass(1), mockClass(2), mockClass(3), mockClass(4)],
      },
      spring: {
        season: SeasonEnum.SP,
        year: 2019,
        termId: 201930,
        status: StatusEnum.CLASSES,
        classes: [mockClass(5), mockClass(6), mockClass(7), mockClass(8)],
      },
      summer1: {
        season: SeasonEnum.S1,
        year: 2019,
        termId: 201940,
        status: StatusEnum.CLASSES,
        classes: [mockClass(9), mockClass(10)],
      },
      summer2: {
        season: SeasonEnum.S2,
        year: 2019,
        termId: 201960,
        status: StatusEnum.CLASSES,
        classes: [],
      },
    },
    2020: {
      year: 2020,
      isSummerFull: false,
      fall: {
        season: SeasonEnum.FL,
        year: 2020,
        termId: 202010,
        status: StatusEnum.CLASSES,
        classes: [mockClass(11), mockClass(12), mockClass(13), mockClass(14)],
      },
      spring: {
        season: SeasonEnum.SP,
        year: 2020,
        termId: 202030,
        status: StatusEnum.CLASSES,
        classes: [mockClass(15), mockClass(16), mockClass(17), mockClass(18)],
      },
      summer1: {
        season: SeasonEnum.S1,
        year: 2020,
        termId: 202040,
        status: StatusEnum.CLASSES,
        classes: [mockClass(19), mockClass(20)],
      },
      summer2: {
        season: SeasonEnum.S2,
        year: 2020,
        termId: 202060,
        status: StatusEnum.CLASSES,
        classes: [],
      },
    },
  },
};
