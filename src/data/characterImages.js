// ============================================================
//  NARUTO ARENA — Imagens Oficiais dos Personagens
//  Fonte: Naruto Wiki (Fandom) — uso pessoal, não comercial
//  https://naruto.fandom.com/wiki/Narutopedia
// ============================================================

const W = 'https://static.wikia.nocookie.net/naruto/images'

export const CHARACTER_IMAGES = {
  // ── NARUTO CLÁSSICO ──────────────────────────────────────
  naruto_c:   `${W}/d/d6/Naruto_Part_I.png`,
  sasuke_c:   `${W}/2/21/Sasuke_Part_1.png`,
  sakura_c:   `${W}/6/64/Sakura_Part_1.png`,
  kakashi_c:  `${W}/2/27/Kakashi_Hatake.png`,
  rock_lee:   `${W}/9/97/Rock_Lee_Part_I.png`,
  neji:       `${W}/7/7e/Neji_Part_I.png`,
  tenten:     `${W}/d/da/Tenten_Part_1.png`,
  hinata:     `${W}/9/97/Hinata.png`,
  kiba:       `${W}/0/03/Kiba.png`,
  shino:      `${W}/9/9c/Shino.png`,
  shikamaru:  `${W}/4/44/Shikamaru_Part_I.png`,
  choji:      `${W}/7/7d/Ch%C5%8Dji_Akimichi.png`,
  ino:        `${W}/d/dd/Ino.png`,
  gaara:      `${W}/2/20/Gaara_in_Part_I.png`,
  temari:     `${W}/b/bb/Temari_newshot.png`,
  kankuro:    `${W}/7/7d/Kankur%C5%8D1.png`,
  kurenai:    `${W}/6/67/Kurenai_Part_I.png`,
  guy:        `${W}/3/31/Might_Guy.png`,
  asuma:      `${W}/7/7c/Asuma.png`,
  jiraiya:    `${W}/2/21/Profile_Jiraiya.png`,
  tsunade:    `${W}/b/b3/Tsunade_infobox2.png`,
  orochimaru: `${W}/1/14/Orochimaru_Infobox.png`,
  kabuto:     `${W}/c/c9/Kabuto_Part_1.png`,
  zabuza:     `${W}/3/37/Zabuza_Momochi.png`,
  haku:       `${W}/9/90/Haku.png`,
  kimimaro:   `${W}/c/c8/Kimimaro_infobox.png`,

  // ── AKATSUKI ─────────────────────────────────────────────
  itachi:     `${W}/b/bb/Itachi.png`,
  kisame:     `${W}/2/25/Kisame.png`,
  deidara:    `${W}/0/06/Deidara.png`,
  sasori:     `${W}/f/f7/Sasori.png`,
  hidan:      `${W}/e/e3/Hidan.png`,
  kakuzu:     `${W}/5/57/Kakuzu.png`,
  zetsu:      `${W}/5/5f/White_Zetsu.png`,
  pain:       `${W}/7/76/Yahiko.png`,
  konan:      `${W}/5/58/Konan_Infobox.png`,
  tobi:       `${W}/4/4a/Obito_Uchiha.png`,

  // ── SHIPPUDEN ────────────────────────────────────────────
  naruto_s:     `${W}/7/7d/Naruto_Part_II.png`,
  sasuke_s:     `${W}/1/13/Sasuke_Part_2.png`,
  sakura_s:     `${W}/b/ba/Sakurap2.png`,
  kakashi_s:    `${W}/2/25/Kakashi_Part_III.png`,
  sai:          `${W}/0/07/Sai_Infobox.png`,
  yamato:       `${W}/f/f7/Yamato_newshot.png`,
  killerbee:    `${W}/6/63/Killer_B.png`,
  minato:       `${W}/7/71/Minato_Namikaze.png`,
  nagato:       `${W}/4/46/Nagato.png`,
  obito:        `${W}/4/4a/Obito_Uchiha.png`,
  madara:       `${W}/f/fd/Madara.png`,
  hashirama:    `${W}/7/7e/Hashirama_Senju.png`,
  naruto_bijuu: `${W}/7/7d/Naruto_Part_II.png`,
  // -- EXAME CHUNIN / VILAES --
  dosu:       `${W}/c/c9/Dosu_Kinuta.png`,
  zaku:       `${W}/4/44/Zaku_Abumi.png`,
  kin:        `${W}/4/4a/Kin_Tsuchi.png`,
  yoroi:      `${W}/e/e6/Yoroi_Akado.png`,
  // -- JONINS E INSTRUTORES --
  iruka:      `${W}/d/d6/Iruka_Umino.png`,
  anko:       `${W}/5/50/Anko_Mitarashi.png`,
  ibiki:      `${W}/3/37/Ibiki_Morino.png`,
  hayate:     `${W}/b/b4/Hayate_Gek%C5%8D.png`,
  genma:      `${W}/6/68/Genma_Shiranui.png`,
  baki:       `${W}/6/6e/Baki.png`,
  chiyo:      `${W}/1/1a/Chiyo.png`,
  rasa:       `${W}/5/59/Rasa.png`,
  mifune:     `${W}/b/b9/Mifune.png`,
  // -- ESPADACHINS DA NEVOA --
  suigetsu:   `${W}/4/44/Suigetsu_H%C5%8Dzuki.png`,
  ameyuri:    `${W}/4/4b/Ameyuri_Ringo.png`,
  chojuro:    `${W}/1/18/Chojuro.png`,
  // -- JINCHUURIKI --
  yugito:     `${W}/5/5e/Yugito_Ni%C4%AB.png`,
  yagura:     `${W}/9/99/Yagura_Karatachi.png`,
  han:        `${W}/b/ba/Han.png`,
  utakata:    `${W}/8/86/Utakata.png`,
  fu:         `${W}/2/26/F%C5%AB.png`,
  // -- KAGES --
  hiruzen:    `${W}/4/40/Hiruzen_Sarutobi.png`,
  mei:        `${W}/0/09/Mei_Terumi.png`,
  onoki:      `${W}/3/3f/%C5%8Cn%C5%8Dki.png`,
  raikage_a:  `${W}/b/b5/Fourth_Raikage.png`,
  darui:      `${W}/e/e5/Darui.png`,
  kurotsuchi: `${W}/3/3b/Kurotsuchi.png`,
}

// Habilidades iconicas — imagens para os jutsus mais famosos
export const SKILL_IMAGES = {
  // Naruto
  nc3:      `${W}/0/0a/Rasengan_Naruto.png`,
  ns3:      `${W}/f/f4/Rasenshuriken.png`,

  // Sasuke
  sc3:      `${W}/b/ba/Chidori.png`,
  sc4:      `${W}/7/7a/Curse_Mark_of_Heaven.png`,

  // Kakashi
  kakashi_c_3: `${W}/b/ba/Chidori.png`,
  ks3:         `${W}/6/67/Kamui.png`,

  // Itachi
  itachi_2: `${W}/a/a3/Amaterasu.png`,
  itachi_1: `${W}/a/aa/Tsukuyomi.png`,

  // Gaara
  gaara_4:  `${W}/7/7c/Sand_Burial.png`,

  // Rock Lee
  lee_3:    `${W}/9/97/Rock_Lee_Part_I.png`,

  // Pain
  pain_1:   `${W}/8/89/Shinra_Tensei.png`,
  pain_2:   `${W}/0/0f/Chibaku_Tensei.png`,

  // Minato
  minato_3: `${W}/0/0a/Rasengan_Naruto.png`,
  // Rock Lee
  rl4:        `${W}/d/d9/Night_Guy.png`,
  // Kages
  sar4:       `${W}/a/a6/Shiki_Fujin.png`,
  ono4:       `${W}/3/36/Jinton_Genkai_Hakuri_no_Jutsu.png`,
  rai4:       `${W}/e/e2/Double_Lariat.png`,
  yug4:       `${W}/7/73/Bijuudama.png`,
  yag4:       `${W}/7/73/Bijuudama.png`,
  han4:       `${W}/7/73/Bijuudama.png`,
  uta4:       `${W}/7/73/Bijuudama.png`,
  fu4:        `${W}/7/73/Bijuudama.png`,
  bee4:       `${W}/7/73/Bijuudama.png`,
  // Minato
  mn3:        `${W}/0/0a/Rasengan_Naruto.png`,

}

export default CHARACTER_IMAGES
