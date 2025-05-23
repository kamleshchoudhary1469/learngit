import {
	CONNECTIONARR,
	NODE_ORACLEDB_CONNECTIONSTRING,
	ORACLE_CLIENT_EXEC_PATH,
} from "./envConfig";
import oracledb from "oracledb";

const configObj = JSON.parse(
	Buffer.from(CONNECTIONARR, "base64").toString("utf8")
);

export const dbConfigFunc = async (origin: any, accYear: any = undefined, subModuleCode: any = undefined) => {
	const { config } = await dbConfigParms(origin, accYear, subModuleCode);
	return {
		user: config?.user,
		password: config?.password,
		connectString: config?.connectionStr ?? NODE_ORACLEDB_CONNECTIONSTRING,
		externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
	}
};

export const dbConfigParms = async (origin: any, accYear: any = undefined, subModuleCode: any = undefined) => {
	const config = configObj?.[origin ?? "/localhost"];
	return {
		config: { ...(config?.modules?.[subModuleCode]?.[accYear] ?? config), accYear, subModuleCode },
		obj: configObj?.[origin ?? "/localhost"],
	};
};

const poolConfigObj = ({ each, mainE }: any) => ({
	user: each?.user,
	password: each?.password,
	connectString: each?.connectionStr ?? NODE_ORACLEDB_CONNECTIONSTRING,
	externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
	poolMax: 800 ?? each?.poolMax ?? mainE?.poolMin ?? 4,
	poolMin: each?.poolMin ?? mainE?.poolMin ?? 1,
	poolIncrement: each?.poolIncrement ?? mainE?.poolIncrement ?? 2,
	poolTimeout: each?.poolTimeout ?? mainE?.poolTimeout ?? 180,
	queueTimeout: each?.queueTimeout ?? mainE?.queueTimeout ?? 100000,
	// stmtCacheSize: each?.stmtCacheSize ?? 50
})

export const setUpConnection = async ({ dbPools, homeorigin }: any) => {
	try {
		const keys = Object.keys(configObj)?.filter(e => e == homeorigin) ?? [];

		for (let i = 0; i < keys.length;) {
			const each: any = configObj[keys[i]];
			if (each?.accYear && Object.keys(each?.accYear)?.length) {
				const accUsers = Object.keys(each?.accYear);
				for (let i = 0; i < accUsers.length; i++) {
					if (dbPools[accUsers[i]]) continue;
					if (each?.accYear?.[accUsers[i]]) dbPools[each?.accYear?.[accUsers[i]]?.user] = await oracledb.createPool(poolConfigObj({ each: each?.accYear?.[accUsers[i]] }))
				}
			}
			const modulesObj: any = Object.values(each?.modules ?? "{}").reduce((a: any, c: any) => {
				Object.values(c).forEach(e => a.push(e))
				return a;
			}, []);
			for (let index = 0; index < modulesObj.length; index++) {
				const inEach = modulesObj[index];
				await oracledb.createPool(poolConfigObj({ each: inEach, mainE: each }))
			}
			if (!dbPools[each?.user]) dbPools[each?.user] = await oracledb.createPool(poolConfigObj({ each }))
			i++;
		}

		console.log(dbPools, "dbPools");

	} catch (error) {
		console.error(error, "setUpConnection");
	}
}
