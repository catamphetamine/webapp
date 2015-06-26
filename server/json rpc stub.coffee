class Json_rpc_stub

	constructor: ->
		@reset()

		@hash_profiles = [{
			title : 'IP + IP (simmetrize)'
			id    : 0
		}, {
			title : 'IPsrc + IPdst'
			id    : 1
		}, {
			title : 'MAC + MAC (simmetrize)'
			id    : 2
		}, {
			title : 'MACsrc + MACdst'
			id    : 3
		}, {
			title : 'IP + Port + ProtoType (five tuple)'
			id    : 4
		}, {
			title : 'EtherType'
			id    : 5
		}, {
			title : 'IP + IP (simmetrize) + Random'
			id    : 6
		}]

	reset: ->
		@DIStartIndex = 0

		@ports   = []
		@lbg     = []
		@mirrors = []
		@acl     = []

		@mappers = {}

		@port_count = 48 + 4 * 4

		for i in [0..8]
			@mappers[i] = 
				mapper_id    : i
				mapper_name  : 'mapper #' + i
				mapper_array : []

		for i in [1..@port_count]
			@ports.push
				id                  : i
				state               : if Math.random() < 0.5 then 1 else 0
				enabled             : 1
				parser_level        : 4
				mac_table           : 0
				eth_mode            : 1
				mac_learning        : 1
				deep_inspection     : no
				rx_octets           : 0
				tx_octets           : 0
				rx_crc_error_octets : 0
				tx_drop_octets      : 0

	getSwitchInfo: =>

		data = 
			Ports: []

		for i in [1..@port_count]
			if @ports[i - 1].state == 1
				@ports[i - 1].rx_octets           += Math.floor(Math.random() * 10)
				@ports[i - 1].tx_octets           += Math.floor(Math.random() * 10)
				@ports[i - 1].rx_crc_error_octets += Math.round(Math.random() * 1)
				@ports[i - 1].tx_drop_octets      += Math.round(Math.random() * 1)

		return {
			Ports      : @ports
			PortsCount : @ports.length
			Serial     : 'ABCDEF1234567890'
			timestamp  : new Date().getTime()
		}

	generate_id: ->
		@ids = @ids || []
		random_id = -> Math.floor(new Date().getTime() / 1000) + Math.round(Math.random() * 9999)

		id = random_id()
		while @ids.has(id)
			id = random_id()

		return id

	getPortEnabled: (parameters) =>
		if @ports[parameters.id - 1].enabled then 1 else 0

	setPortEnabled: (parameters) =>
		@ports[parameters.id - 1].enabled = if parameters.enable then 1 else 0

		@ports[parameters.id - 1].state = if @ports[parameters.id - 1].enabled == 0
			0
		else
			if Math.random() < 0.5 then 1 else 0

	getPortEthMode: (parameters) =>
		@ports[parameters.id - 1].eth_mode

	setPortEthMode: (parameters) =>
		@ports[parameters.id - 1].eth_mode = parameters.eth_mode

	getPortLearning: (parameters) =>
		@ports[parameters.id - 1].mac_table

	setPortLearning: (parameters) =>
		@ports[parameters.id - 1].mac_table = parameters.enable

	getPortParserLevel: (parameters) =>
		@ports[parameters.id - 1].parser_level

	setPortParserLevel: (parameters) =>
		@ports[parameters.id - 1].parser_level = parameters.level

	setPortDIParsing: (parameters) =>
		@ports[parameters.id - 1].deep_inspection = parameters.enable

	setDIStartIndex: (parameters) => 
		@DIStartIndex = parameters.index

	getLBGList: =>
		return {
			lbg_count : @lbg.length
			lbg_ids   : @lbg.map((lbg) -> lbg.lbg_id)
		}

	createLBG: (parameters) =>
		lbg = parameters
		lbg.lbg_id = @generate_id()

		@lbg.push(lbg)
		return lbg.lbg_id

	createMirror: (parameters) =>
		mirror = 
			mirror_id : @generate_id()
			dst_port  : parameters.port
			ports     : []

		@mirrors.push(mirror)
		return mirror.mirror_id

	addMirrorPort: (parameters) =>
		mirror = @mirrors.filter((mirror) -> mirror.mirror_id == parameters.id)[0]

		mirror.ports.push(parameters.port)
		return {}

	getMirror: (parameters) =>
		@mirrors.filter((mirror) -> mirror.mirror_id == parameters.mirror_id)[0]

	getMirrorList: =>
		return {
			mirror_count : @mirrors.length
			mirror_ids   : @mirrors.map((mirror) -> mirror.mirror_id)
		}

	getLBG: (parameters) =>
		@lbg.filter((lbg) -> lbg.lbg_id == parameters.lbg_id)[0]

	delLBG: (parameters) =>
		lbg = @lbg.filter((lbg) -> lbg.lbg_id == parameters.lbg_id)[0]
		@lbg.remove(lbg) if lbg?

	getACLList: =>
		return {
			acl_count : @acl.length
			acl_ids   : @acl.map((acl) -> acl.acl_id)
		}

	getACL: (parameters) =>
		@acl.filter((acl) -> acl.acl_id == parameters.acl_id)[0]

	createACL: (parameters) =>
		acl = parameters
		acl.acl_id = @generate_id()

		@acl.push(acl)
		return acl.acl_id

	delACL: (parameters) =>
		acl = @acl.filter((acl) -> acl.acl_id == parameters.acl_id)[0]
		@acl.remove(acl) if acl?

	getNetConfig: (parameters) =>
		dhcp    : 0
		gateway : "192.168.0.1"
		dns1    : "192.168.0.1"
		ip      : "192.168.0.236"
		mask    : "255.255.255.0"

	getHashProfiles: (parameters) =>
		profiles: @hash_profiles

	getDefaultHashProfile: (parameters) =>
		profile: @hash_profiles[0].id

	getMapperCurSize: (parameters) =>
		@mappers[parameters.mapper_id].mapper_array.reduce(((reduced, i) -> Math.max(reduced, i)), 0)

	getMapperMaxSize: (parameters) => 30

	getMapper: (parameters) => 
		@mappers[parameters.mapper_id]

	clearMapper: (parameters) => 
		@mappers[parameters.mapper_id].mapper_array = []
		return yes

	createMapper: (parameters) => 
		@mappers[parameters.mapper_id].mapper_array = parameters.mapper_array
		return yes

	resetSwitch: (parameters) =>
		@reset()
		throw new Error('Resetting device. This error is normal and is required')

	softResetSwitch: (parameters) =>
		@reset()
		yes

	resetPortStat: (parameters) =>
		for i in [1..@port_count]
			if @ports[i - 1].state == 1
				@ports[i - 1].rx_octets           = 0
				@ports[i - 1].tx_octets           = 0
				@ports[i - 1].rx_crc_error_octets = 0
				@ports[i - 1].tx_drop_octets      = 0

	setNetConfig: (parameters) => yes
	saveConfig: (parameters) => yes

	updateLicense: (parameters) => 0
	updateFirmware: (parameters) => 0

module.exports = Json_rpc_stub